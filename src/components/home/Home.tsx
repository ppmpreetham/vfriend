import FriendCard from "./friendCard";

const Home = () => {
  return (
    <div className="h-full w-full">
      <FriendCard available={false} name="Preetham" location="AB-1" />
      <FriendCard
        available={false}
        name="Sreeyansh"
        location="AB-1"
        distance="3"
      />
    </div>
  );
};

export default Home;
