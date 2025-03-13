import { useState } from "react";
import { Course } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface CertificateProps {
  course: Course;
}

export default function Certificate({ course }: CertificateProps) {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  const generateCertificate = async () => {
    setGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.src = "https://images.unsplash.com/photo-1494537449588-7f07cede2556";
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      canvas.width = 1200;
      canvas.height = 800;

      // Draw certificate background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Add certificate content
      ctx.fillStyle = "#1a1a1a";
      ctx.textAlign = "center";
      
      ctx.font = "bold 48px sans-serif";
      ctx.fillText("Certificate of Completion", canvas.width / 2, 200);
      
      ctx.font = "32px sans-serif";
      ctx.fillText(`This is to certify that`, canvas.width / 2, 300);
      
      ctx.font = "bold 40px sans-serif";
      ctx.fillText(user?.username || "", canvas.width / 2, 380);
      
      ctx.font = "32px sans-serif";
      ctx.fillText(`has successfully completed the course`, canvas.width / 2, 460);
      
      ctx.font = "bold 40px sans-serif";
      ctx.fillText(course.title, canvas.width / 2, 540);

      const date = new Date().toLocaleDateString();
      ctx.font = "28px sans-serif";
      ctx.fillText(`Issued on ${date}`, canvas.width / 2, 640);

      // Download certificate
      const link = document.createElement("a");
      link.download = `certificate-${course.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-blue-600/10">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
        <p className="text-muted-foreground mb-4">
          You've completed the course. Download your certificate now.
        </p>
        <Button onClick={generateCertificate} disabled={generating}>
          <Download className="w-4 h-4 mr-2" />
          {generating ? "Generating..." : "Download Certificate"}
        </Button>
      </div>
    </Card>
  );
}
