// True in development or when NEXT_PUBLIC_DEV_MODE=true (enables dev panel on prod builds)
export const DEV_MODE =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_DEV_MODE === 'true';
