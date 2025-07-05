import MultipleSelector from "@/components/ui/multiselect";
import { colors } from "@/data";
import { useFormContext } from "react-hook-form";

export default function ColorsSelect({
  label = "Select colors",
  inputName,
  className = "",
  value = [],
}) {
  const { setValue } = useFormContext();

  return (
    <MultipleSelector
      onChange={(colors) => setValue(inputName, colors)}
      commandProps={{ label }}
      value={value}
      defaultOptions={colors}
      placeholder="Select colors"
      hideClearAllButton={false}
      hidePlaceholderWhenSelected={false}
      emptyIndicator={<p className="text-center text-sm">No results found</p>}
      className={className}
    />
  );
}
