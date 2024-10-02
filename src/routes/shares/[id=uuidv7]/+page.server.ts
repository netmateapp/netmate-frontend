import type { PageServerData } from "./$types";

export const load: PageServerData = ({ params }) => {
  return {
    share: {
      id: params.id
    }
  };
}
