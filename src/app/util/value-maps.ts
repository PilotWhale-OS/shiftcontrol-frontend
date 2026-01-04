import {time} from "../components/inputs/input-time/input-time.component";

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
  },
  datetimeStringAsLocalTime(value: string): time{
    const date = new Date(value);
    return {
      hour: date.getHours(),
      minute: date.getMinutes()
    };
  },
  dateAsLocalDateStartOfDayString(value: Date){
    value = new Date(value.setHours(0,0,0,0));
    return value.toISOString();
  },
  dateAsLocalDateEndOfDayString(value: Date){
    value = new Date(value.setHours(23,59,59,999));
    return value.toISOString();
  },
  combineDateAndLocalTime(date: Date | undefined, localTime: time | undefined){
    if(date === undefined) {
      return undefined;
    }

    const combined = new Date(date.getTime());
    if(localTime !== undefined) {
      combined.setHours(localTime.hour, localTime.minute, 0, 0);
    } else {
      combined.setHours(0, 0, 0, 0);
    }
    return combined;
  }
};
