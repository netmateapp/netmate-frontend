import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
  return {
    tag: {
      id: "af2318c6-7815-4867-80b5-efc56f128d23",
      name: "ブルーアーカイブ",
    },
  };
};
