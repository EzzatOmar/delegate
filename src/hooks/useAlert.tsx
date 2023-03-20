import { createUniqueId } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { render } from "solid-js/web";
import Alert, {AlertProps} from "../base-components/Alert";
import { GlobalError } from "../error";

type SetAlertParams = {children: JSX.Element | string, duration?:number, variant?:AlertProps['variant']};

type AlertReturn = {
  setAlert: (args: SetAlertParams) => string;
  clearAlert: (id: string) => void;
  handleGlobalError: (gErr: GlobalError) => void;
}

export const useAlert = ():[undefined, AlertReturn] => {

  const clearAlert = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  }

  const handleGlobalError = (gErr: GlobalError) => {
    if(gErr.UserAlert) {
      setAlert({children: gErr.UserAlert, duration: 5000, variant: "danger"});
    }
    if(gErr.UserWarning) {
      setAlert({children: gErr.UserWarning, duration: 5000, variant: "warning"});
    }
    if(gErr.UserInfo) {
      setAlert({children: gErr.UserInfo, duration: 5000, variant: "primary"});
    }
  }


  const setAlert = ({children, duration, variant}:SetAlertParams) => {
    const id = createUniqueId();

    render(() => <div class="absolute top-2 right-2" style="min-width: 16rem;" id={id}>
      <Alert variant={variant} closable={true} onClose={() => clearAlert(id)}>{children}</Alert>
    </div>, document.getElementById("root") as HTMLElement)

    if(duration) {
      setTimeout(() => clearAlert(id), duration);
    }

    return id;
  }


  return [undefined, { setAlert, clearAlert, handleGlobalError }];
}
