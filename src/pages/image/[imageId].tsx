import type { Album } from "@prisma/client";
import type { GetServerSidePropsContext, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { getImage } from "../../utils/fetchDataFromPrisma";

type ImageType = {
  id: string;
  album: Album;
  filename: string;
  photographer: string;
  date: Date;
};

const ImagePage: NextPage<{ image: ImageType }> = ({ image }) => {
  return (
    <section className="mx-auto -mt-4 flex h-full max-w-7xl flex-col gap-2 px-5 sm:mt-0 sm:flex-row sm:gap-8">
      <div className="flex-grod relative h-[500px] min-w-[250px] flex-grow sm:min-w-[300px]">
        <Image
          src={
            image.filename
              ? `http://holmstrom.ddns.net:8080/df/lowres/${image.filename}`
              : ""
          }
          alt={`${image.album.title}, ${image.album.description}`}
          fill
          className="object-contain object-center"
          sizes="750px"
          quality={90}
        />
      </div>
      <div className="flex flex-grow-0 flex-col items-start justify-center gap-2 sm:min-w-[250px] sm:gap-4">
        <Link href={`/album/${image.album.id}`} className="font-medium">
          Till albummet
        </Link>
        <p>Fotograf: {image.photographer}</p>
        <p>Filename: {image.filename}</p>
        <div className="flex flex-col gap-1 sm:gap-2">
          <h2>Album information:</h2>
          <p>Titel: {image.album.title}</p>
          <p>Beskrivning: {image.album.description}</p>
        </div>
        <p className="mt-2">
          Kontakta oss{" "}
          <Link className="underline underline-offset-2" href="/contact">
            här
          </Link>{" "}
          med filnamnet eller bild id:t för att få bilden i högre upplösning
        </p>
      </div>
    </section>
  );
};

export default ImagePage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const imageId = context.params?.imageId?.toString() || "";
    const image = await getImage({ imageId });
    return {
      props: {
        image: JSON.parse(JSON.stringify(image)) as typeof image,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}
