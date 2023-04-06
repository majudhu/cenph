export function previewPhotoFromInput(setData: (data: string) => void) {
  return function previewPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        setData(reader.result as string);
      });
    }
  };
}

export function pastePhotoFromClipboard(
  setData: (data: string) => void,
  inputRef: React.RefObject<HTMLInputElement>
) {
  return async function pastePhoto() {
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      const imageTypes = clipboardItem.types.filter((type) =>
        type.startsWith("image/")
      );
      for (const imageType of imageTypes) {
        const blob = await clipboardItem.getType(imageType);
        setData(URL.createObjectURL(blob));
        const data = new DataTransfer();
        data.items.add(
          new File([blob], "from clipboard", {
            type: blob.type,
            lastModified: Date.now(),
          })
        );
        inputRef.current!.files = data.files;
      }
    }
  };
}
