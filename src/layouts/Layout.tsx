import { NextPage } from "next";

interface Props {
  children: React.ReactNode;
}

const Layout: NextPage<Props> = ({ children }) => {
  return (
    <div className="tw-mx-auto tw-flex tw-h-screen tw-max-w-7xl tw-flex-col tw-py-10 tw-px-5">
      {children}
    </div>
  );
};

export default Layout;
