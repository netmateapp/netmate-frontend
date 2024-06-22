import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
  return {
    handle: {
      id: params.id,
      name: "はらむらのどか",
    },
  };
};
