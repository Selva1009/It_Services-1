"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, X } from "lucide-react";

export default function TransferProducts({ onClose }) {
  const [oldUsername, setOldUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!oldUsername || !newUsername) {
      Swal.fire("Error", "Please enter both old and new user names", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/transfer-products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ oldUsername, newUsername }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.newUserId) {
          // ✅ Update both keys so other pages get the correct ID
          sessionStorage.setItem("vendor_user_id", data.newUserId);
          sessionStorage.setItem("userId", data.newUserId); // <-- Critical for products page
        }

        Swal.fire({
          title: "Success",
          text: data.message || "Products transferred successfully",
          icon: "success",
        }).then(() => {
          setOldUsername("");
          setNewUsername("");
          if (onClose) onClose(); // close modal
          window.location.reload(); // ✅ Reload everything with updated ID
        });
      } else {
        Swal.fire("Error", data.message || "Transfer failed", "error");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      Swal.fire("Error", "Server error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <AnimatePresence>
      <motion.div
        initial={ { opacity: 0 } }
        animate={ { opacity: 1 } }
        exit={ { opacity: 0 } }
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={ { y: 20, opacity: 0 } }
          animate={ { y: 0, opacity: 1 } }
          exit={ { y: 20, opacity: 0 } }
          transition={ { type: "spring", damping: 30 } }
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl rounded-xl border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl">Transfer Products</CardTitle>
                    <CardDescription className="mt-1">
                      Move products from one user to another
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ onClose }
                  className="rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <form onSubmit={ handleSubmit }>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldUsername" className="text-sm font-medium text-gray-700">
                    Old User
                  </Label>
                  <Input
                    id="oldUsername"
                    value={ oldUsername }
                    onChange={ (e) => setOldUsername(e.target.value) }
                    placeholder="Enter old username"
                    className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newUsername" className="text-sm font-medium text-gray-700">
                    New User
                  </Label>
                  <Input
                    id="newUsername"
                    value={ newUsername }
                    onChange={ (e) => setNewUsername(e.target.value) }
                    placeholder="Enter new username"
                    className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={ () => {
                    setOldUsername("");
                    setNewUsername("");
                  } }
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  disabled={ isSubmitting }
                >
                  { isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    "Transfer Products"
                  ) }
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
