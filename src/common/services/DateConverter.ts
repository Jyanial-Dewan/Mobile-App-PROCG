export const convertDate = (isoDateString: Date) => {
  // console.log(isoDateString, "isoDateString");
  const date = new Date(isoDateString);
  const formattedDate = date.toLocaleString();
  return formattedDate;
};
