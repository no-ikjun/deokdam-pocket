import Image from "next/image";
import styles from "./components.module.css";

type MentExampleProps = {
  profile: string;
  ment: string;
};

export default function MentExample({ profile, ment }: MentExampleProps) {
  return (
    <div className={styles.ment_div}>
      <Image
        src={`/images/profile_${profile}.png`}
        alt="profile"
        width={28}
        height={28}
      />
      <p className={styles.ment}>{ment}</p>
    </div>
  );
}
