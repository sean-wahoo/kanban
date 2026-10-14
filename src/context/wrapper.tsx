import { HandlesProvider } from "./handles";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <HandlesProvider>{children}</HandlesProvider>;
};

export default Wrapper;
