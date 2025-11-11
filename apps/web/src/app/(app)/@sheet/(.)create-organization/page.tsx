import { InterceptedSheetContent } from "@/components/intercepted-sheet-content";
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { OrganizationForm } from "../../create-organization/organization-form";

export default function CreateOrganization() {
  return (
    <Sheet defaultOpen>
      <InterceptedSheetContent side="right">
        <SheetHeader>
          <SheetTitle>Create organization</SheetTitle>
        </SheetHeader>

        <div className="px-4">
          <OrganizationForm />
        </div>
      </InterceptedSheetContent>
    </Sheet>
  );
}
