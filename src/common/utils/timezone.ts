import { DateTime } from 'luxon';

export const timeZone = 'Asia/Ho_Chi_Minh';

export const getTime = (input?: Date | string): Date => {
  const dt = input
    ? DateTime.fromISO(input instanceof Date ? input.toISOString() : input, {
        zone: 'utc',
      })
    : DateTime.utc();

  return dt.setZone(timeZone).toJSDate();
};

export const startOfMonth = (date: string) => {
  return DateTime.fromISO(date, { zone: timeZone }).startOf('month').toJSDate();
};

export const endOfMonth = (date: string) => {
  return DateTime.fromISO(date, { zone: timeZone }).endOf('month').toJSDate();
};

export const startOfDay = (date: string) => {
  return DateTime.fromISO(date, { zone: timeZone }).startOf('day').toJSDate();
};

export const endOfDay = (date: string) => {
  return DateTime.fromISO(date, { zone: timeZone }).endOf('day').toJSDate();
};
