import React from "preact/compat";

const MarkImportant: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span className="px-2 bg-primary text-black rounded-2xl">{children}</span>
);

const DescriptionText = () => {
  return (
    <div className="px-8 flex flex-col h-fit gap-4 md:gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl font-bold md:text-6xl">What is VFriend?</h2>
        <div className="text-lg md:text-4xl flex flex-col gap-4">
          <p>
            Aren't you <MarkImportant>frustrated</MarkImportant> of messaging
            your friends <i>“where are you?”</i> or <i>“when are you free”</i> a
            bazillion times? Well, I was.
          </p>
          <p>
            Now, it just takes a single tap to find out which of your friends
            are free at any given point of time, and where they are.
          </p>
          <p>
            With the only cost of your{" "}
            <MarkImportant> friends' consent</MarkImportant>, of course.
          </p>
          <p>
            Maybe one day, it'll be as easy as asking your friends directly.
          </p>
          <p>
            Simply put, it's a{" "}
            <strong className="font-bold">fully offline</strong> app that helps
            you keep track of your friends' schedules{" "}
            <MarkImportant>without internet connection</MarkImportant>.{" "}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-4xl font-bold md:text-6xl">Why I built VFriend</h2>
        <div className="text-lg md:text-4xl flex flex-col gap-4">
          <p>
            If you've asked me this question back in <strong>2023</strong>, I'd
            have said it's a <strong className="font-bold">script</strong> for
            me to keep track of my friends' timetables. Never have I ever
            thought it'd become an app.
          </p>
          <p>
            Almost about{" "}
            <strong className="font-bold">
              {new Date().getFullYear() - 2023}
            </strong>{" "}
            years ago, while I was a freshman at my college, I had an oddly
            specific problem of having a little{" "}
            <MarkImportant>too many friends</MarkImportant>.
          </p>
          <p>
            Oftentimes, I'd often find myself digging through old{" "}
            <MarkImportant>WhatsApp/Discord</MarkImportant> chats, trying to
            find the timetables they had sent me, one by one, over and over.
          </p>
          <p>
            It was tedious, repetitive, and honestly, a little ridiculous. I
            kept thinking, there has to be a{" "}
            <MarkImportant>better way</MarkImportant> to do this.
          </p>
          <p>
            But back then, I didn't know much about app development. I had spent
            time learning web dev, but even now, as I write this, you could say,
            this is my first real app.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DescriptionText;
