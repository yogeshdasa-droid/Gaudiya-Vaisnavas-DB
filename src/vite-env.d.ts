// Vite: «import x from "…?url"» gives the address of the file (pdf.js worker, PdfThumb.tsx)
declare module "*?url" {
  const url: string;
  export default url;
}
