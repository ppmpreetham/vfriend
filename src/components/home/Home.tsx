import FriendCard from "./friendCard";

const Home = () => {
  return (
    <div className="h-full w-full">
      <FriendCard
        available={true}
        name="Preetham"
        location="AB1-209"
        time="11:30PM"
      />
      <FriendCard
        available={false}
        name="Sreeyansh"
        location="AB3-110"
        distance="30"
        time="12:30 PM"
      />
      <FriendCard
        available={false}
        name="Raghav"
        location="AB3-110"
        time="12:30 PM"
      />
    </div>
  );
};

export default Home;
