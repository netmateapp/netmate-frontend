import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
  return {
    tag: {
      id: params.id,
      name: "ブルーアーカイブ",
    },
  };
};