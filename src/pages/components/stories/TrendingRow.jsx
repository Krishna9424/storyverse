import "./TrendingRow.css";
import StoryCard from "./StoryCard";

export default function TrendingRow({ stories }) {

  return (
    <div className="trending-row">

      <h2 className="section-title">🔥 Trending</h2>

      <div className="trending-scroll">
        {stories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

    </div>
  );
}
