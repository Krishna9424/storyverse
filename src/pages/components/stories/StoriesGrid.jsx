import "./StoriesGrid.css";
import StoryCard from "./StoryCard";

export default function StoriesGrid({
  stories,
  lastElementRef,
  onLike,
  navigateToStory,
  navigateToUser
}) {

  return (
    <div className="stories-grid">

      {stories.map((story, index) => {

        const isLast = index === stories.length - 1;

        return (
          <div ref={isLast ? lastElementRef : null} key={story.id}>
            <StoryCard
              story={story}
              onLike={onLike}
              navigateToStory={navigateToStory}
              navigateToUser={navigateToUser}
            />
          </div>
        );
      })}

    </div>
  );
}
