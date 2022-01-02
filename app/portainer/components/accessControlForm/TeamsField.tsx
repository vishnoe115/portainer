import { TeamsSelector } from '@/portainer/components/TeamsSelector';
import { FormControl } from '@/portainer/components/form-components/FormControl';
import { Link } from '@/portainer/components/Link';
import { Team } from '@/portainer/teams/types';

interface Props {
  teams: Team[];
  value: number[];
  onChange(value: number[]): void;
}

export function TeamsField({ teams, value, onChange }: Props) {
  return (
    <FormControl
      label="Authorized teams"
      tooltip={
        teams.length > 0
          ? 'You can select which team(s) will be able to manage this resource.'
          : undefined
      }
      inputId="teams-selector"
    >
      {teams.length > 0 ? (
        <TeamsSelector
          teams={teams}
          onChange={onChange}
          value={value}
          inputId="teams-selector"
        />
      ) : (
        <span className="small text-muted">
          You have not yet created any teams. Head over to the
          <Link to="portainer.teams">Teams view</Link> to manage teams.
        </span>
      )}
    </FormControl>
  );
}
