import {NextApiRequest, NextApiResponse} from "next";
import add_key_to_github from "./utils/add_key_to_github";
import {
  addEnvVar,
  finishedStep,
  notNonEmptyString,
} from "./utils/helperFunctions";
import BashExec from "./utils/BashExec";

var keygen = require("ssh-keygen");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.body === undefined)
    res.status(400).json({status: "fail", error: "No body sent"});

  const {GITHUB_USERNAME, GITHUB_TOKEN, step_nb} = req.body;

  if (notNonEmptyString(GITHUB_USERNAME) && notNonEmptyString(GITHUB_TOKEN)) {
    res.status(400).json({status: "fail", error: "Input data error"});
    return;
  }

  keygen(
    {
      location: "ubility_rsa",
      comment: "ubility@idp.com",
      read: true,
    },
    async function (err: string, out: {key: string; pubKey: string}) {
      if (err) {
        res.status(500).json({
          status: "fail",
          result: {error: true, stdout: "", stderr: err},
        });
        return console.error("Error in github ssh key generation: " + err);
      }

      const {pass, result} = await add_key_to_github(GITHUB_TOKEN, out.pubKey);

      const bashRes = await BashExec(
        "sh pages/api/scripts/github-setup.sh",
        res
      );

      if (pass && bashRes.pass) {
        addEnvVar("GITHUB_USERNAME", GITHUB_USERNAME);
        addEnvVar("GITHUB_TOKEN", GITHUB_TOKEN);

        finishedStep(step_nb);

        res.status(200).json({
          status: "pass",
          result: {error: false, stdout: "", stderr: ""},
        });
      }

      res.status(500).json({
        status: pass && bashRes.pass ? "pass" : "fail",
        result: {error: result},
      });
    }
  );
}
