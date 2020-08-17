dev:
	docker-compose up
down:
	docker-compose down
console:
	cd hasura && hasura console --admin-secret myadminsecretkey
migrate:
	cd hasura && hasura migrate apply --admin-secret myadminsecretkey
reset-migrations:
	cd hasura && sudo rm -rf migrations
	cd hasura && hasura migrate create "init" --from-server --admin-secret myadminsecretkey
apply-metadata:
	cd hasura && hasura metadata apply --admin-secret myadminsecretkey
export-metadata:
	cd hasura && hasura metadata export apply --admin-secret myadminsecretkey
