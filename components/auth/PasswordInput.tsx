"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

interface PasswordInputProps {
   name?: string;
   value?: string;
   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
   placeholder?: string;
   disabled?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
   name,
   value,
   onChange,
   placeholder = "Lozinka",
   disabled = false,
}) => {
   const [showPassword, setShowPassword] = useState(false);

   console.log(!!value);

   return (
      <div className="relative w-full">
         <Input
            name={name}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={onChange}
            className="pr-10"
         />
         <Button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center"
            disabled={!value || disabled}
            variant="ghost"
            aria-label={showPassword ? "Hide password" : "Show password"}
         >
            {showPassword ? (
               <EyeOff className="w-5 h-5" />
            ) : (
               <Eye className="w-5 h-5" />
            )}
         </Button>
      </div>
   );
};

export default PasswordInput;
