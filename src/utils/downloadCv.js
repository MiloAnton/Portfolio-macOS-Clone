export const CV_FILE_NAME = "CV-Milo-Roche-2026.pdf";

export const downloadCv = () => {
  const link = document.createElement("a");
  link.href = `/${CV_FILE_NAME}`;
  link.download = CV_FILE_NAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
};
