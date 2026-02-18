import "./StoriesPage.css";
import StoriesGrid from "../../components/stories/StoriesGrid";
import TrendingRow from "../../components/stories/TrendingRow";

export default function StoriesPage({
  stories,
  loading,
  lastElementRef,
  onLike,
  navigateToStory,
  navigateToUser
}) {
  return (
    <div className="stories-page">

      {/* HEADER */}
      <div className="stories-header">
        <h1>Discover Stories</h1>
        <p>Explore worlds written by creators</p>
      </div>

      {/* TRENDING */}
     <section className="stories-section full-bleed">
  <TrendingRow stories={stories.slice(0,3)} />
</section>


      {/* GRID */}
      <section className="stories-section">
        <StoriesGrid
          stories={stories}
          lastElementRef={lastElementRef}
          onLike={onLike}
          navigateToStory={navigateToStory}
          navigateToUser={navigateToUser}
        />
      </section>

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
}
