import type { GetServerSidePropsContext, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { env } from "../../../env/server.mjs";
import { getAlbumAsAdmin } from "../../../utils/fetchDataFromPrisma";
import { trpc } from "../../../utils/trpc";
import type { AdminAlbumType } from "../../../utils/types";

// TODO: refactor this page

const EditAlbum: NextPage<{
  album: AdminAlbumType;
}> = ({ album }) => {
  const albumInfoDefaultValue = {
    title: album.title,
    description: album.description,
    date: album.date.toLocaleString(),
  };
  const [albumInfo, setAlbumInfo] = useState(albumInfoDefaultValue);

  const router = useRouter();

  const albumInfoMutation = trpc.album.updateInfo.useMutation({
    onSuccess: (data) => {
      const { title, description, date } = data;
      setAlbumInfo({ title, description, date: date.toLocaleString() });
      router.reload();
    },
  });

  const imageVisibility = trpc.image.setVisibility.useMutation({
    onSuccess: () => {
      router.reload();
    },
  });

  const imageCoverImage = trpc.image.setCoverImage.useMutation({
    onSuccess: () => {
      router.reload();
    },
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-row justify-between">
        <div className="flex-grow">
          <p>{album.id}</p>
          <input
            className="w-full"
            onChange={(e) => {
              setAlbumInfo((prev) => {
                return { ...prev, title: e.target.value };
              });
            }}
            type="text"
            value={albumInfo.title}
          />
          <input
            className="w-full"
            onChange={(e) => {
              setAlbumInfo((prev) => {
                return { ...prev, description: e.target.value };
              });
            }}
            type="text"
            value={albumInfo.description}
          />
          <input
            defaultValue={new Date(album.date).toLocaleString()}
            onChange={(e) => {
              setAlbumInfo((prev) => {
                return {
                  ...prev,
                  date: new Date(e.target.value).toLocaleString(),
                };
              });
            }}
            type="datetime-local"
          />
          <p>
            Number of images:
            {` ${album._count.images}`}
          </p>
        </div>
        <div className="flex h-fit flex-row gap-2">
          <button
            className="rounded border-2 border-black/40 bg-yellow-400 px-6 py-2"
            onClick={() => router.back()}
            type="button"
          >
            Back
          </button>
          <button
            className="rounded border-2 border-black/60 bg-green-600 px-6 py-2"
            onClick={() => {
              albumInfoMutation.mutate({
                albumId: album.id,
                date: new Date(albumInfo.date),
                description: albumInfo.description,
                title: albumInfo.title,
              });
            }}
            type="submit"
          >
            Save
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {album.images.map(
          ({
            id: imageId,
            filename,
            date,
            photographer,
            visible,
            coverImage,
          }) => {
            return (
              <div
                key={imageId}
                className="flex flex-row items-center justify-start gap-8"
              >
                <Image
                  alt=""
                  height={128}
                  quality={100}
                  src={filename ? `/images/thumb/${filename}` : ""}
                  width={128}
                  unoptimized
                />
                <div className="flex flex-grow flex-row gap-2">
                  <p>{filename}</p>
                  <p>{new Date(date).toISOString()}</p>
                  <p>{photographer}</p>
                  <p>{visible ? "Synlig" : "Dold"}</p>
                </div>
                <div className="flex flex-row gap-2">
                  <button
                    className="rounded border-2 border-black/60 bg-green-600 px-4 py-2"
                    type="button"
                  >
                    <Link href={`/image/${imageId}`} target="_blank">
                      L??nk till bild
                    </Link>
                  </button>
                  <button
                    className="rounded border-2 border-gray-700/60 bg-yellow-400 px-4 py-2"
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="rounded border-2 border-black/60 bg-red-500 px-4 py-2"
                    onClick={() => {
                      imageVisibility.mutate({ imageId, visibility: visible });
                    }}
                    type="button"
                  >
                    G??r
                    {!visible ? " synlig" : " dold"}
                  </button>
                  <button
                    className="rounded border-2 border-black/60 bg-green-600 px-4 py-2"
                    onClick={() => {
                      imageCoverImage.mutate({
                        imageId,
                        coverImage: !coverImage,
                      });
                    }}
                    type="button"
                  >
                    {`${coverImage ? "D??lj" : "S??tt till"} omslag`}
                  </button>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default EditAlbum;

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<{ notFound: true } | { props: { album: AdminAlbumType } }> {
  const password = context.query?.password?.toString();

  if (
    !(password && password === "brabilder") &&
    env.NODE_ENV !== "development"
  ) {
    return {
      notFound: true,
    };
  }

  try {
    const albumId = context.params?.albumId || "";
    const album = await getAlbumAsAdmin(albumId.toString());

    return {
      props: {
        album: JSON.parse(JSON.stringify(album)) as AdminAlbumType,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}
