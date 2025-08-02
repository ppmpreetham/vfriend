import { LinkPreview } from "../components/HoverLink";
import MarkImportant from "../components/Important";

const PrivacyPage = () => {
  return (
    <div className={"text-2xl md:text-4xl px-6 text-white flex flex-col gap-4"}>
      <h3 className={"text-4xl md:text-8xl"}>Privacy?</h3>
      <div>
        <p>Maybe you're too worried about the privacy of your data</p>
        <p>
          What if I told you that the app is completely{" "}
          <MarkImportant>offline</MarkImportant>?
        </p>
        <div>
          And the source code is{" "}
          <LinkPreview
            url="https://www.github.com/ppmpreetham/vfriend"
            className="underline text-primary"
            height={200}
          >
            open source
          </LinkPreview>{" "}
          too? (meaning you can view the code of the app)
        </div>
      </div>
      <div>
        <h6>
          The <strong>only</strong> data that's stored on your{" "}
          <MarkImportant>friends</MarkImportant> device when you're sharing your
          timetable is:
        </h6>
        <ul className="ml-4 list-disc pl-6">
          <li>Your Timetable</li>
          <li>Your name</li>
          <li>Your registration number</li>
          <li>Your top hangout spots</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyPage;
