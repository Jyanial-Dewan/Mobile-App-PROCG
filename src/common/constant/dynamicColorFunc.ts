export const dynamicColorFunc = (title: string) => {
  switch (title) {
    case 'Async Tasks':
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
    case 'Scheduled Tasks':
      return {
        container: '#fff7ed',
        text: '#ea580c',
        border: 'orange',
      };
    case 'Users':
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
