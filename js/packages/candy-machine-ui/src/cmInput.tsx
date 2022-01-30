export const CMInput = () => {
    return (
      <div>
        <input
          placeholder="Enter CMID"
        />
        <button id="selectCmid">
          Use CMID
        </button>
      </div>
    );
}

document.getElementById('selectCmid').click(() => {
  alert(0)
});