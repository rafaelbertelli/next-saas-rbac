import prisma from "@/infra/prisma/prisma-connection";
import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { BadGatewayError } from "@/routes/_error/5xx/bad-gateway-error";
import { env } from "@repo/env";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  authenticateWithGithubSchema,
  githubAccessTokenDataSchema,
  githubUserDataSchema,
} from "./schema";
export async function authenticateWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/session/authenticate-with-github",
    {
      schema: authenticateWithGithubSchema,
    },
    async (request, reply) => {
      const { code } = request.body;

      const githubOAuthUrl = new URL(env.GITHUB_OAUTH_LOGIN_URI);
      githubOAuthUrl.searchParams.set(
        "redirect_uri",
        env.GITHUB_OAUTH_REDIRECT_URI
      );
      githubOAuthUrl.searchParams.set(
        "client_secret",
        env.GITHUB_OAUTH_CLIENT_SECRET
      );
      githubOAuthUrl.searchParams.set("client_id", env.GITHUB_OAUTH_CLIENT_ID);
      githubOAuthUrl.searchParams.set("code", code);

      try {
        const githubAccessTokenResponse = await fetch(githubOAuthUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const githubAccessTokenData = await githubAccessTokenResponse.json();
        const { access_token: githubAccessToken } =
          githubAccessTokenDataSchema.parse(githubAccessTokenData);

        const githubUserResponse = await fetch(
          env.GITHUB_OAUTH_GRANTED_ACCESS_URI,
          {
            headers: {
              Authorization: `Bearer ${githubAccessToken}`,
            },
          }
        );

        const githubUserData = await githubUserResponse.json();
        const {
          id: githubId,
          name,
          email,
          avatar_url: avatarUrl,
        } = githubUserDataSchema.parse(githubUserData);

        if (!email) {
          throw new BadRequestError(
            "Your Github account must have an email address to continue"
          );
        }

        let user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name,
              avatarUrl,
            },
          });
        }

        let account = await prisma.account.findUnique({
          where: {
            provider_ownerId: {
              provider: "GITHUB",
              ownerId: user.id,
            },
          },
        });

        if (!account) {
          account = await prisma.account.create({
            data: {
              ownerId: user.id,
              provider: "GITHUB",
              providerAccountId: githubId.toString(),
            },
          });
        }

        const token = await reply.jwtSign(
          { sub: user.id },
          { sign: { expiresIn: "7d" } }
        );

        return reply.status(200).send({
          message: "Logged in successfully",
          data: {
            token,
          },
        });
      } catch (error) {
        throw new BadGatewayError("Failed to authenticate with Github");
      }
    }
  );
}
