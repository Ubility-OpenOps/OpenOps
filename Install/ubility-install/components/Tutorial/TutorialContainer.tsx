import {Step} from "@/static/steps";
import React, {ReactNode} from "react";
import TutorialStep from "./TutorialStep";
import {Paper, Typography} from "@mui/material";

interface Props {
  step: Step;
  jenkins_admin_pass: string;
  onInputLinkClickHandler: (id: string) => void;
}

function TutorialContainer({
  step,
  jenkins_admin_pass,
  onInputLinkClickHandler,
}: Props) {
  return (
    <div className="w-full flex flex-col mb-16">
      <Typography className="text-xl my-2">{step.tutorial?.title}</Typography>
      <div className="max-w-5xl flex flex-col gap-10">
        {step.tutorial?.steps.map((tutStep, i) => (
          <TutorialStep
            onInputLinkClickHandler={onInputLinkClickHandler}
            tutStep={tutStep}
            key={i}
            jenkins_admin_pass={jenkins_admin_pass}
          />
        ))}
      </div>
    </div>
  );
}

export default TutorialContainer;
