import { ErrorCode } from "@/lib/errors";
import Button from "../Button";

const ActionButton = (props) => {
  return (
    <Button
      {...props}
      size="small"
      className="font-medium underline"
      color="primary"
    />
  );
};

const ErrorAction = ({ error }) => {
  if (error.code === ErrorCode.PPLX_FORBIDDEN_ERROR) {
    return (
      <p className="ml-2 text-secondary-text text-sm">
        Please visit{" "}
        <a
          href="https://www.perplexity.ai"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          https://www.perplexity.ai
        </a>{" "}
        and try again
      </p>
    );
  }

  if (
    error.code === ErrorCode.NETWORK_ERROR ||
    (error.code === ErrorCode.UNKOWN_ERROR &&
      error.message.includes("Failed to fetch"))
  ) {
    return (
      <div>
        <p className="ml-2 text-secondary-text text-sm">
          'Please check your network connection'
        </p>
      </div>
    );
  }

  return null;
};

export default ErrorAction;
