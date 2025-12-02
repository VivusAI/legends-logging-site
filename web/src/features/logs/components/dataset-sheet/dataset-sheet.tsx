import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CreateDatasetSchema,
  createDatasetSchemaWithMaxRetention,
} from "@/typings/dataset";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateDataset } from "../../api/dataset-api";

interface DatasetSheetProps {
  organizationId: string | undefined;
}

export default function DatasetSheet({ organizationId }: DatasetSheetProps) {
  const formMethods = useForm<CreateDatasetSchema>({
    defaultValues: {
      name: "",
      description: "",
      retentionDays: undefined,
    },
    // we'll change this at some point,
    // but I dont really see the point of having a max retention days at all here
    resolver: zodResolver(createDatasetSchemaWithMaxRetention(90)),
  });

  const { mutate } = useCreateDataset(organizationId);

  function onSubmit(data: CreateDatasetSchema) {
    mutate(data);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Create
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[20%]">
        <SheetHeader>
          <SheetTitle>Create dataset</SheetTitle>
        </SheetHeader>

        <div className="mt-4 px-4">
          <Form {...formMethods}>
            <form
              className="space-y-4"
              onSubmit={formMethods.handleSubmit(onSubmit)}
            >
              <FormField
                name="name"
                control={formMethods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>*Name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        autoCapitalize="none"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                control={formMethods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        autoCapitalize="none"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="retentionDays"
                control={formMethods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>*Retention Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        max={90}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value === "" ? "" : Number(value);
                          field.onChange(numValue);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      How long logs will be stored before automatic deletion.
                      Must be between 1 and {90} days.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={false}>
                Create
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
