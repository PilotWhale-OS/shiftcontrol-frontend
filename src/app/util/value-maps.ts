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
    return `${value.getFullYear()}-${(value.getMonth()+1).toString().padStart(2,"0")}-${value.getDate().toString().padStart(2,"0")}`;
  },
  datetimeAsLocalDate(date: Date){
    return new Date(
      date.getFullYear()
      + "-" + (date.getMonth() + 1).toString().padStart(2,"0") + "-"
      + date.getDate().toString().padStart(2,"0")
      + "T00:00:00"
    );
  }
};
