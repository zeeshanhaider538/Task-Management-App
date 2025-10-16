export const isDueToday = (dueDate) => {
  const today = new Date();
  const date = new Date(dueDate);
  return date.toDateString() === today.toDateString();
};
