import type { Album, Image as ImageType } from "@prisma/client";
import Link from "next/link";
import type { FC } from "react";
import { copyToClipboard } from "../../utils/copyToClipboard";

export const ImageInformation: FC<{
  image: ImageType;
  album: (Album & { images: ImageType[] }) | null | undefined;
  nextImageId: string | undefined;
}> = ({ image, album, nextImageId }) => {
  return (
    <div className="mt-8 flex flex-col justify-center gap-4 rounded-md bg-[#333333] py-4 px-8 text-[#a7a7a7] md:flex-row">
      <p>Fotograf: {image?.photographer}</p>
      <Link
        href={`${window.location.origin}/test/${album?.id}?imageId=${nextImageId}`}
      >
        Permanent länk till bilden
      </Link>
      <p
        className="cursor-copy"
        onClick={() => {
          copyToClipboard("image-id");
        }}
      >
        Filename: {image?.filename}
      </p>
      <textarea
        id="image-id"
        className="hidden"
        readOnly
        value={image?.id}
      ></textarea>
    </div>
  );
};
