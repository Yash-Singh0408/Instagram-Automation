type SpinnerProps = {
  color?: string;
};

export const Spinner = ({ color }: SpinnerProps) => {
  return (

    // Time stamp of video 1:35:00 for reference

    <div role="status" className="animate-spin h-4 w-4">
      <svg className="h-full w-full" viewBox="25 25 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
        ></circle>
      </svg>
    </div>
  );
};
