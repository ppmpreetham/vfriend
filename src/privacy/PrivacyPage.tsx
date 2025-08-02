import React from "react";

const PrivacyPage = () => {
  return (
    <div className={"text-2xl md:text-4xl px-6"}>
      <h3>Privacy?</h3>
      <p>Maybe you're too worried about the privacy of your data</p>
      <p>What if I told you that the app is completely offline?</p>
      <div>
        And the source code is <a href="">open source</a> too? (meaning you can
        view the code of the app)
      </div>
    </div>
  );
};

export default PrivacyPage;
