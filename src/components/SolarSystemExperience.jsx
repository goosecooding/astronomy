
import dynamic from "next/dynamic";

const SolarSystem = dynamic(() => import("./SolarSystem"), {
  ssr: false,
  loading: () => <div className="space-loading" />,
});

export default function SolarSystemExperience() {
  return (
    <main className="space-experience">
      <SolarSystem />
    </main>
  );
}
