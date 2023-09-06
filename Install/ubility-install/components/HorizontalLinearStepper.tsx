import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import InstallStep from "./InstallStep";
import steps from "../static/steps";
import {ReactNode, useState} from "react";
import {Button, Step} from "@mui/material";

export default function HorizontalLinearStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());

  const isStepOptional = (step: number) => {
    // return step === 1;
    return false;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const unFinishStep = async (step: number) => {
    const res = await fetch(`/api/undoStepFinish`, {
      method: "POST",
      body: JSON.stringify({
        step: step,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    await res.json();
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      unFinishStep(prevActiveStep - 1);
      return prevActiveStep - 1;
    });
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{width: "100%"}}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps
          .sort((a, b) => a.nb - b.nb)
          .map((step, index) => {
            const stepProps: {completed?: boolean} = {};
            const labelProps: {
              optional?: ReactNode;
            } = {};
            if (isStepOptional(index)) {
              labelProps.optional = (
                <Typography variant="caption">Optional</Typography>
              );
            }
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={step.label} {...stepProps}>
                <StepLabel {...labelProps}>{step.label}</StepLabel>
              </Step>
            );
          })}
      </Stepper>
      {steps
        .sort((a, b) => a.nb - b.nb)
        .map((step, i) => (
          <div key={i} className={`${step.nb !== activeStep && "hidden"}`}>
            <InstallStep
              step={step}
              handleNext={handleNext}
              handleReset={handleReset}
              handleBack={handleBack}
              activeStep={activeStep}
              stepsNb={steps.length}
            />
          </div>
        ))}

      {activeStep == steps.length && (
        <div>
          <Typography sx={{mt: 2, mb: 1}}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{display: "flex", flexDirection: "row", pt: 2}}>
            <Box sx={{flex: "1 1 auto"}} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </div>
      )}
    </Box>
  );
}
