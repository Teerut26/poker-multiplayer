import { NextPage } from "next";
import { Card } from "react-bootstrap";
import GoogleIcon from "@mui/icons-material/";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { BsDiscord } from "react-icons/bs";
import { Button } from "antd";

interface Props {}

const SignIn: NextPage<Props> = () => {
  const router = useRouter();
  return (
    <div className="tw-flex tw-h-screen tw-flex-col tw-items-center tw-justify-center">
      <div>
        <Button
          icon={<BsDiscord className="tw-mr-3" />}
          onClick={() =>
            signIn("discord", {
              callbackUrl: router.query.callbackUrl as string,
            })
          }
          type="primary"
          size={"large"}
        >
          Sign In With Discord
        </Button>
      </div>
    </div>
  );
};

export default SignIn;
