export const mapValue = {
  undefinedIfEmptyString(value: string | null | undefined): string | undefined {
    if(value === null || value === undefined || value.trim() === "") {
      return undefined;
    }
    return value;
  },
  undefinedIfEmptyLocalDate(value: Date | null | undefined): string | undefined {
    if(value === null || value === undefined) {
      return undefined;
    }
    return value.toISOString().split("T")[0];
  },
};
