import { useRouter } from "next/router";
import FeedbackReview from "../../components/feedback/review";

export default function FeedbackPage() {
  const router = useRouter();
  const { token } = router.query;

  // Stub data; in future fetch by token
  const tourName = "Обзорная экскурсия по центру";
  const guideName = "Александр";
  const startDate = "12 окт";
  const link = token ? `/feedback/${token}` : "/feedback/sample-token";

  return (
    <FeedbackReview
      token={token || ""}
      tourName={tourName}
      guideName={guideName}
      startDate={startDate}
      link={link}
    />
  );
}
