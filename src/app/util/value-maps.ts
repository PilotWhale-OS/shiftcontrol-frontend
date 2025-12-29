export const mapValue = {
  undefinedIfEmptyString(value: string | null | undefined): string | undefined {
    if(value === null || value === undefined || value.trim() === "") {
      return undefined;
    }
    return value;
  },
  datetimeToUtcDateString(value: Date){
    return `${value.getFullYear()}-${(value.getMonth()+1).toString().padStart(2,"0")}-${value.getDate().toString().padStart(2,"0")}`;
  },
  dateStringAsEndOfDayDatetime(value: string){
    return new Date(
      value
      + "T23:59:59.999Z"
    );
  },
  dateStringAsStartOfDayDatetime(value: string){
    return new Date(
      value
      + "T00:00:00.000Z"
    );
  }
};
