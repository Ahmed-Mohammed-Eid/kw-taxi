# RULES

- Always use primereact when it's applicable
- for toasting always use `react-hook-toast`
- for http requests always use `axios`
- Don't use third party packages, just when I tell you to use them
- Don't install plugins just tell me what we need to install and I will install it manually
- Make sure to optimize UI UX
- Don't use Card component instead use the className `card`
- Don't use the primereact toast component.
- In layout always use grid if possible from primeflex
- Use scss modules for styling if you need to type custom style
- For forms use `react-hook-form` and for the validation use `zod`

## DESIGN PRINCIPLES

- Keep the UI simple and intuitive.
- Ensure consistency in design elements and patterns.
- Prioritize accessibility and usability.
- Use whitespace effectively to create a clean layout.
- Provide clear feedback for user actions.
- Minimize the number of actions required to complete a task.
- Use `prime-react` components whenever possible to maintain consistency and leverage built-in functionality but not the primereact `FileUpload` component instead use the custom `FileUploadComponent` at `src/components/FileUploadComponent`.