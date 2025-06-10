import { DateTime } from 'luxon';

export const getVietnamDate = (input?: Date | string): Date => {
  const dt = input
    ? DateTime.fromISO(input instanceof Date ? input.toISOString() : input, {
        zone: 'utc',
      })
    : DateTime.utc();

  return dt.setZone('Asia/Saigon').toJSDate();
};
