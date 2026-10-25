import Storefront from "../components/Storefront";
import { getHeroMedia } from "../lib/hero-media.server";
export default function Page() {
  return <Storefront heroMedia={getHeroMedia()} />;
}
