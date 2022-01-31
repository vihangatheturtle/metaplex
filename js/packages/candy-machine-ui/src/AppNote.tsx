export interface AppNoteProps {
    noteText?: string;
  }

export const AppNote = (props: AppNoteProps) => {
    if (props.noteText !== null && props.noteText !== '' && props.noteText !== undefined) {
        return (
            <div>
                <p>
                    {props.noteText}
                </p>
            </div>
        );
    } else {
        return (
            <div>
                <p>
                    No notices
                </p>
            </div>
        );
    }
}