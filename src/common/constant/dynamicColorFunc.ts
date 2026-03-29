export const dynamicColorFunc = (title: string) => {
  switch (title) {
    case 'Total Async Tasks':
      return {
        container: '#f9fafb',
        text: '#4b5563',
        border: 'gray',
      };
    case 'Active Tasks':
      return {
        container: '#f0fdf4',
        text: '#16a34a',
        border: 'green',
      };
    case 'Total Scheduled Tasks':
      return {
        container: '#fff7ed',
        text: '#ea580c',
        border: 'orange',
      };
    case 'Total Users':
      return {
        container: '#f9fafb',
        text: '#4b5563',
        border: 'gray',
      };
    default:
      return {
        container: '#f9fafb',
        text: '#4b5563',
        border: 'gray',
      };
  }
};
